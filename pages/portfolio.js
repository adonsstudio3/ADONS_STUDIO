import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function PortfolioPage(){
  const router = useRouter()
  useEffect(()=>{ router.replace('/projects') }, [router])
  return (
    <>
      <Head>
        <title>Redirecting…</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main style={{ padding: '6rem 1rem' }}>
        <p>Redirecting to <a href="/projects">Projects</a>…</p>
      </main>
    </>
  )
}
