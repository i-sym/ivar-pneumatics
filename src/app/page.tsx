import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Page() {
  return (
    <>
      <div className="h-screen w-full flex justify-center items-center flex-col gap-4">
        <h1 className="text-4xl font-semibold">IVAR Pneumatic sandbox</h1>
        <Button asChild>
          <Link href="/ar">AR</Link>
        </Button>
      </div>
    </>
  )
}