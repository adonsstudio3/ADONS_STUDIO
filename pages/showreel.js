import Head from 'next/head'


export default function ShowreelPage() {
  return (
    <>
      <Head>
        <title>Redirecting…</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main style={{ padding: '6rem 1rem' }}>
  <p>Redirecting to <a href="/projects" rel="nofollow">Projects</a>…</p>
      </main>
    </>
  );
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/projects',
      permanent: true,
    },
  };
}
