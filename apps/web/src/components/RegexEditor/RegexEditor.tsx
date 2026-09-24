import { useState } from "react";
import {
  Paper,
  Stack,
  TextInput,
  Title,
  Text,
  Group,
  Button,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";

interface RegexEditorProps {
  pattern: string;
  onPatternChange: (v: string) => void;
  /** Compiles `pattern` via Thompson's construction and loads the result into
   *  the NFA graph below (see Workspace's regex panel + useSimulation.loadGraph). */
  onGenerate: () => void;
}

export function RegexEditor({
  pattern,
  onPatternChange,
  onGenerate,
}: RegexEditorProps) {
  const [error, setError] = useState<string | null>(null);

  return (
    <Paper withBorder p="md">
      <Title order={5} mb="sm">
        Generate NFA from Regular Expression
      </Title>
      <Stack gap={8}>
        <Group align="flex-start" wrap="nowrap">
          <TextInput
            ff="monospace"
            placeholder="e.g. (a|b)*abb"
            value={pattern}
            onChange={(e) => {
              onPatternChange(e.currentTarget.value);
              // TODO: validate against @schismata/core's regex grammar once parsing lands;
              // clearing the error optimistically for now.
              setError(null);
            }}
            error={error}
            style={{ flex: 1 }}
          />
          <Button
            rightSection={<IconArrowRight size={16} />}
            disabled={pattern.trim().length === 0}
            onClick={onGenerate}
          >
            Generate
          </Button>
        </Group>
        <Text size="xs" c="dimmed">
          {/* TODO: wire up @schismata/core once regex → NFA (Thompson's construction) is
              implemented; onGenerate is a no-op stub until then. Generating replaces the
              graph below, which you can keep editing like any other NFA. */}
          Builds the equivalent NFA via Thompson&apos;s construction and loads
          it into the graph below, where you can keep editing it directly.
        </Text>
      </Stack>
    </Paper>
  );
}
