import { expect, test } from './fixtures'

test('a user can lasso-bundle a second task and clear the bundle', async ({
  page,
  task,
  secondTask,
}) => {
  test.setTimeout(60_000)

  await page.goto(`/tasks/${task.id}`)

  await expect(page.getByText(`Task #${task.id}`).first()).toBeVisible({ timeout: 15_000 })

  // Opening a task URL directly no longer auto-claims it (only in-app
  // navigation with claimTask=true does); clicking "Map this task" locks it,
  // at which point the completion action buttons replace that prompt.
  await page.getByRole('button', { name: 'Map this task' }).click()
  await expect(page.getByRole('button', { name: 'Fixed', exact: true })).toBeVisible({
    timeout: 20_000,
  })

  const multiTaskTrigger = page.getByRole('button', { name: 'Work on multiple tasks' })
  await expect(multiTaskTrigger).toBeVisible({ timeout: 15_000 })
  await multiTaskTrigger.click()

  const drawButton = page.getByRole('button', { name: 'Draw to add tasks' })
  await expect(drawButton).toBeVisible({ timeout: 10_000 })
  await drawButton.click()
  await expect(page.getByRole('button', { name: 'Drawing...' })).toBeVisible({ timeout: 5_000 })

  // Where the map's auto-fit leaves `secondTask`'s marker is not somewhere a
  // lasso can rely on: the map's own controls sit over the canvas -- and the
  // multi-task panel grows another row the moment drawing starts -- so a marker
  // that lands under one of them swallows the lasso's mouse-down and nothing is
  // ever drawn. Centre the map on the marker instead, which puts it in the
  // middle of the canvas, clear of every control, and draw a small lasso there.
  const canvas = page.locator('canvas.maplibregl-canvas')
  const box = await canvas.boundingBox()
  if (!box) throw new Error('Map canvas did not render')

  interface TestMap {
    project: (l: [number, number]) => { x: number; y: number }
    setCenter: (l: [number, number]) => void
  }
  await page.evaluate((lngLat) => {
    const map = (window as unknown as { __e2eMap?: TestMap }).__e2eMap
    if (!map) throw new Error('__e2eMap was not exposed by TaskMap')
    map.setCenter(lngLat)
  }, secondTask.coordinates)

  // Wait for the camera to settle there rather than assuming it lands at once,
  // and fail here rather than mis-clicking if something pulls it back.
  const projectSecondTask = () =>
    page.evaluate((lngLat) => {
      const map = (window as unknown as { __e2eMap?: TestMap }).__e2eMap
      return map ? map.project(lngLat) : null
    }, secondTask.coordinates)

  const centre = { x: box.width / 2, y: box.height / 2 }
  await expect
    .poll(
      async () => {
        const projected = await projectSecondTask()
        if (!projected) return null
        return Math.hypot(projected.x - centre.x, projected.y - centre.y) < 2
      },
      { timeout: 10_000 }
    )
    .toBe(true)

  const projected = await projectSecondTask()
  if (!projected) throw new Error('__e2eMap was not exposed by TaskMap')
  const markerX = box.x + projected.x
  const markerY = box.y + projected.y
  const r = 20
  const corners: [number, number][] = [
    [markerX - r, markerY - r],
    [markerX + r, markerY - r],
    [markerX + r, markerY + r],
    [markerX - r, markerY + r],
    [markerX - r, markerY - r],
  ]

  // A lasso only draws on exposed canvas, and a control drawn over the corner
  // it starts from is invisible to the assertions further down: the bundle
  // simply never appears. Say so here instead.
  const coveredCorner = await page.evaluate(
    (points) =>
      points.find(([x, y]) => {
        const el = document.elementFromPoint(x, y)
        return !(el instanceof HTMLCanvasElement)
      }) ?? null,
    corners
  )
  expect(coveredCorner, 'the lasso must be drawn on exposed map canvas').toBeNull()

  await page.mouse.move(corners[0][0], corners[0][1])
  await page.mouse.down()
  for (const [x, y] of corners.slice(1)) {
    await page.mouse.move(x, y, { steps: 8 })
  }
  await page.mouse.up()

  // The lasso selection is synced into an active bundle containing both tasks.
  const bundleTrigger = page.getByRole('button', { name: /Working on 2 tasks/ })
  await expect(bundleTrigger).toBeVisible({ timeout: 10_000 })

  // Clear the bundle via the "Delete" keyboard shortcut, confirmed through
  // ClearBundleDialog, and verify the panel reverts to its unbundled state.
  await page.keyboard.press('Delete')
  await expect(page.getByRole('heading', { name: 'Clear Task Bundle?' })).toBeVisible({
    timeout: 10_000,
  })
  await page.getByRole('button', { name: 'Clear Bundle' }).click()

  await expect(page.getByRole('button', { name: 'Work on multiple tasks' })).toBeVisible({
    timeout: 10_000,
  })
  await expect(bundleTrigger).not.toBeVisible()

  // Clean up: mark the primary task Fixed so this run leaves both tasks in a
  // terminal state, matching task-workflow.spec.ts's convention.
  await page.getByRole('button', { name: 'Fixed', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Complete Task Action' })).toBeVisible({
    timeout: 10_000,
  })
  await page.getByRole('button', { name: 'Complete & Continue' }).click()
  await expect(page.getByText('Task marked as Fixed')).toBeVisible({ timeout: 15_000 })
})
