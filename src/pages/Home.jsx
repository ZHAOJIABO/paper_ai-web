import FeatureCard from '../components/common/FeatureCard'
import './Home.css'

function Home() {
  const features = [
    {
      icon: '📝',
      title: '论文润色',
      description: '提升学术写作质量，优化语言表达，让您的论文更加专业规范',
      path: '/polish',
      color: '#2383e2',
      available: true
    },
    {
      icon: '🌐',
      title: '学术翻译',
      description: '中英文互译，保持学术专业性，精准传达研究内容',
      path: '/translate',
      color: '#0f7b6c',
      available: false
    },
    {
      icon: '🔍',
      title: '文献搜索',
      description: '快速查找相关文献和研究，获取最新学术动态',
      path: '/search',
      color: '#e9a23b',
      available: false
    },
    {
      icon: '📋',
      title: '项目申请书',
      description: '协助撰写各类科研项目申请书，提高申请成功率',
      path: '/proposal',
      color: '#764ba2',
      available: false
    },
    {
      icon: '🎓',
      title: '论文审稿',
      description: '提供专业审稿意见和建议，助力论文质量提升',
      path: '/review',
      color: '#e85d75',
      available: false
    },
    {
      icon: '💬',
      title: '审稿回复',
      description: '撰写专业的审稿意见回复，提高论文接收概率',
      path: '/response',
      color: '#16a085',
      available: false
    }
  ]

  return (
    <div className="home-page">
      <div className="home-intro">
        <h2 className="intro-title">选择您需要的功能</h2>
        <p className="intro-subtitle">
          为科研工作者提供全流程智能支持，让学术研究更高效
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
