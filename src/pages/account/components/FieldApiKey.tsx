import { Button } from "@/components/ui/Button"
import { ButtonGroup } from "@/components/ui/ButtonGroup"
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/Form"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/InputGroup"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { Check, CopyCheck, RotateCcwKey } from "lucide-react"
import { useId } from "react"

export const FieldApiKey = ({ apiKey }: React.ComponentProps<typeof FormItem> & { apiKey: string }) => {
    const id = useId()
    const { copy, isCopied } = useCopyToClipboard()
    return (
      <FormItem>
        <FormLabel htmlFor={id}>Key</FormLabel>
        <FormControl>
          <ButtonGroup className="w-full">
            <InputGroup>
              <InputGroupInput id={id} placeholder={apiKey} readOnly />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label="Copy"
                  title="Copy"
                  size="icon-xs"
                  onClick={() => {
                    copy(apiKey)
                  }}
                >
                  {isCopied ? <Check /> : <CopyCheck />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <Button type="button" variant="outline" aria-label="Reset API key">
              <RotateCcwKey aria-hidden="true" />
            </Button>
          </ButtonGroup>
        </FormControl>
        <FormMessage />
      </FormItem>
    )
  }
  