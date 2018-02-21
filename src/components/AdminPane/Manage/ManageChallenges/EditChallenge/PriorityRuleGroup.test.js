import { preparePriorityRuleGroupForSaving,
         preparePriorityRuleGroupForForm } from './PriorityRuleGroup'

describe("preparePriorityRuleGroupForSaving", () => {
  let basicFormGroup = null
  let equalsOperatorFormRule = null
  let containsOperatorFormRule = null
  let emptyOperatorFormRule = null

  beforeEach(() => {
    equalsOperatorFormRule = {
      key: "firstTag",
      operator: "equals",
      value: "foo",
    }

    containsOperatorFormRule = {
      key: "secondTag",
      operator: "contains",
      value: "bar",
    }

    emptyOperatorFormRule = {
      key: "thirdTag",
      operator: "is_empty",
    }

    basicFormGroup = {
      condition: 'AND',
      rules: [
        equalsOperatorFormRule,
        containsOperatorFormRule,
      ],
    }
  })

  test("no rules generates empty stringified object", () => {
    basicFormGroup.rules = []

    expect(
      preparePriorityRuleGroupForSaving(basicFormGroup)
    ).toEqual(JSON.stringify({}))
  })

  test("empty key is treated like empty rule", () => {
    basicFormGroup.rules = [{
      operator: "equals",
    }]

    expect(
      preparePriorityRuleGroupForSaving(basicFormGroup)
    ).toEqual(JSON.stringify({}))
  })

  test("condition and rules are added into results, with dot-separated key and value", () => {
    const result =
      JSON.parse(preparePriorityRuleGroupForSaving(basicFormGroup))

    expect(result.condition).toEqual(basicFormGroup.condition)
    expect(result.rules.length).toBe(basicFormGroup.rules.length)

    for (let i = 0; i < basicFormGroup.rules.length; i++) {
      expect(result.rules[i].operator).toEqual(basicFormGroup.rules[i].operator)
      expect(result.rules[i].value).toEqual(
        `${basicFormGroup.rules[i].key}.${basicFormGroup.rules[i].value}`)
    }

    expect(result).toMatchSnapshot()
  })

  test("empty values are represented as a space in dot-separated string", () => {
    basicFormGroup.rules = [emptyOperatorFormRule]

    const result =
      JSON.parse(preparePriorityRuleGroupForSaving(basicFormGroup))

    expect(
      result.rules[0].value
    ).toEqual(`${basicFormGroup.rules[0].key}. `)

    expect(result).toMatchSnapshot()
  })
})

describe("preparePriorityRuleGroupForForm", () => {
  let basicSavedGroup = null
  let equalsOperatorSavedRule = null
  let containsOperatorSavedRule = null
  let emptyOperatorSavedRule = null

  beforeEach(() => {
    equalsOperatorSavedRule = {
      operator: "equals",
      value: "firstTag.foo",
    }

    containsOperatorSavedRule = {
      operator: "contains",
      value: "secondTag.bar",
    }

    emptyOperatorSavedRule = {
      operator: "is_empty",
      value: "thirdTag. ",
    }

    basicSavedGroup = {
      condition: 'AND',
      rules: [
        equalsOperatorSavedRule,
        containsOperatorSavedRule,
      ],
    }
  })

  test("missing rules generates empty rules", () => {
    basicSavedGroup.rules = []

    expect(
      preparePriorityRuleGroupForForm(basicSavedGroup).ruleGroup.rules.length
    ).toBe(0)
  })

  test("condition and rules are added into results, with parsed keys and values", () => {
    const result = preparePriorityRuleGroupForForm(basicSavedGroup).ruleGroup

    expect(result.condition).toEqual(basicSavedGroup.condition)
    expect(result.rules.length).toBe(basicSavedGroup.rules.length)

    for (let i = 0; i < basicSavedGroup.rules.length; i++) {
      const parsed = basicSavedGroup.rules[i].value.split('.')
      expect(result.rules[i].operator).toEqual(basicSavedGroup.rules[i].operator)
      expect(result.rules[i].key).toEqual(parsed[0])
      expect(result.rules[i].value).toEqual(parsed[1])
    }

    expect(result).toMatchSnapshot()
  })

  test("empty values are represented as an empty string string", () => {
    basicSavedGroup.rules = [emptyOperatorSavedRule]

    const result = preparePriorityRuleGroupForForm(basicSavedGroup).ruleGroup

    expect(result.rules[0].value).toEqual('')

    expect(result).toMatchSnapshot()
  })
})
