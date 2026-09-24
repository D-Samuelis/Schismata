import { AppShell, Tabs, Title, Group } from "@mantine/core";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { AUTOMATON_MODES } from "../config/automatonModes";

export default function AppLayout() {
  const { mode = "dfa" } = useParams<{ mode: string }>();
  const navigate = useNavigate();

  return (
    <AppShell
      header={{ height: 56 }}
      aside={{ width: 340, breakpoint: "sm" }}
      footer={{ height: 64 }}
      padding="md"
    >
      <AppShell.Header px="md">
        <Group h="100%" justify="space-between">
          <Title order={4}>Schismata</Title>

          <Tabs value={mode} onChange={(v) => v && navigate(`/${v}`)}>
            <Tabs.List>
              {Object.entries(AUTOMATON_MODES).map(([id, { label }]) => (
                <Tabs.Tab key={id} value={id}>
                  {label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>

          <div style={{ width: 80 }} />
        </Group>
      </AppShell.Header>

      <AppShell.Aside p="md">
        <div id="aside-portal" />
      </AppShell.Aside>

      <AppShell.Footer px="md">
        <div id="footer-portal" />
      </AppShell.Footer>

      <AppShell.Main>
        <Outlet key={mode} />
      </AppShell.Main>
    </AppShell>
  );
}
