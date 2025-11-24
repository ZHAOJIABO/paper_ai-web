import { Link } from 'react-router-dom'
import './FeatureCard.css'

function FeatureCard({ icon, title, description, path, color, available = true }) {
  return (
    <Link to={path} className="feature-card" style={{ '--card-color': color }}>
      <div className="card-icon">{icon}</div>
      <h3 className="card-title">{title}</h3>
      <p className="card-description">{description}</p>
      {available ? (
        <div className="card-action">
          开始使用 →
        </div>
      ) : (
        <div className="card-badge">即将上线</div>
      )}
    </Link>
  )
}

export default FeatureCard
