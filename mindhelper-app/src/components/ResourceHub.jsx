// src/components/ResourceHub.jsx
import React from 'react';
import './ResourceHub.css';

const ResourceHub = () => {
  const resources = [
    {
      id: 1,
      title: "Managing Academic Stress",
      type: "Article",
      description: "Practical strategies to handle academic pressure effectively.",
      link: "#"
    },
    {
      id: 2,
      title: "Mindfulness Meditation Guide",
      type: "Video",
      description: "A 10-minute guided meditation for stress relief.",
      link: "#"
    },
    {
      id: 3,
      title: "Building Resilience",
      type: "Article",
      description: "Learn how to bounce back from academic setbacks.",
      link: "#"
    },
    {
      id: 4,
      title: "Breathing Exercises for Anxiety",
      type: "Interactive",
      description: "Practice breathing techniques to calm your nervous system.",
      link: "#"
    },
    {
      id: 5,
      title: "Time Management Strategies",
      type: "Article",
      description: "Tips to organize your schedule and reduce overwhelm.",
      link: "#"
    },
    {
      id: 6,
      title: "Progressive Muscle Relaxation",
      type: "Audio",
      description: "A relaxation technique to release physical tension.",
      link: "#"
    }
  ];

  return (
    <div className="resources-container">
      <h2>Wellness Resource Hub</h2>
      <p>Explore self-help materials to support your mental health and well-being.</p>
      
      <div className="resources-grid">
        {resources.map(resource => (
          <div key={resource.id} className="resource-card">
            <div className="resource-type">{resource.type}</div>
            <h3>{resource.title}</h3>
            <p>{resource.description}</p>
            <a href={resource.link} className="resource-link">Access Resource</a>
          </div>
        ))}
      </div>
      
      <div className="resources-categories">
        <h3>Resource Categories</h3>
        <div className="categories-list">
          <span>Stress Management</span>
          <span>Anxiety Relief</span>
          <span>Mindfulness</span>
          <span>Study Skills</span>
          <span>Sleep Improvement</span>
          <span>Motivation</span>
        </div>
      </div>
    </div>
  );
};

export default ResourceHub;