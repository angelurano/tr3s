import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_index/settings')({
  component: SettingsComponent
});

function SettingsComponent() {
  return <div>Hello "/_index/settings"!</div>;
}
