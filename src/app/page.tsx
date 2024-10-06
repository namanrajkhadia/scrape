import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Welcome to Brand Rank Checker</h1>
      <Link href="/brand-rank-checker" className="text-blue-500 hover:underline">
        Go to Brand Rank Checker
      </Link>
    </main>
  )
}