export function LoadingSpinner({ fullPage = false }: { fullPage?: boolean }) {
  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }
  return <Spinner />
}

function Spinner() {
  return (
    <div
      className="size-8 animate-spin rounded-full border-4 border-border border-t-primary"
      role="status"
      aria-label="Loading"
    />
  )
}
