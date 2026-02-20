import Layout from '../components/Layout'
import Header from '../components/Header'
import ProjectsDesign from '../components/ProjectsDesign'
import SEOHead from '../components/SEOHead'

export default function ProjectsPage() {
  return (
    <>
      <Header />
      <Layout>
        <SEOHead page={{ type: 'projects' }} />
        <ProjectsDesign />
      </Layout>
    </>
  )
}
