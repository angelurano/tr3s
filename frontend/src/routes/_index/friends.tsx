import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_index/friends')({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/_index/friends"!</div>;
}
