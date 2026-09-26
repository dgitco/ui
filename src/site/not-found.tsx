import { Link } from "react-router";

export function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-32 text-center">
      <h1 className="text-heading-30">Not here</h1>
      <p className="text-muted-foreground">
        That page doesn't exist. <Link to="/" className="text-foreground underline underline-offset-2">Back home</Link>
      </p>
    </div>
  );
}
