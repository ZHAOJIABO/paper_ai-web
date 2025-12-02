import FeatureCard from '../components/common/FeatureCard'
import './Home.css'

function Home() {
  const features = [
    {
      icon: '📝',
      title: '论文润色',
      description: '提升学术写作质量，优化语言表达，让您的论文更加专业规范。支持智能对比、高亮显示修改内容，帮助您精准把控每一处改动',
      path: '/polish',
      color: '#2383e2',
      available: true
    }
  ]

  return (
    <div className="home-page">
      <div className="home-intro">
        <h2 className="intro-title">AI 论文润色助手</h2>
        <p className="intro-subtitle">
          专业的学术写作润色工具，让您的论文更加专业规范
        </p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </div>
  )
}

export default Home
