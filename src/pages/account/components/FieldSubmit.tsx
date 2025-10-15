import { Button } from "@/components/ui/Button"
import { Field } from "@/components/ui/Field"
import { Spinner } from "@/components/ui/Spinner"

export const FieldSubmit = ({
    className,
    isSubmitting,
    ...props
  }: React.ComponentProps<typeof Field> & {
    isSubmitting: boolean
  }) => {
    return (
      <Field className={className} orientation="horizontal" {...props}>
        <Button disabled={isSubmitting} type="submit" size="lg">
          {isSubmitting ? (
            <>
              <Spinner />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </Field>
    )
  }
  