import Head from 'next/head'
import Layout from '../components/Layout'
import Header from '../components/Header'
import ProjectsDesign from '../components/ProjectsDesign'

export default function ProjectsPage(){
  return (
    <Layout>
      <Head>
        <title>Projects — Adons Studio</title>
        <meta name="description" content="Portfolio and showreel — selected projects from Adons Studio." />
      </Head>

      <Header />
      <ProjectsDesign />
    </Layout>
  )
}
