import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css';

const StoryVisualizer = () => {
  const { storyId } = useParams();
  const [story, setStory] = useState(null);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await fetch(`/api/stories/${storyId}`);
        const data = await response.json();
        setStory(data);
      } catch (error) {
        console.error('Error fetching story:', error);
      }
    };
    fetchStory();
  }, [storyId]);

  if (!story) {
    return <div>Loading...</div>;
  }

  // Calcolo del tempo di lettura (assumendo 200 parole per minuto)
  const readingTime = Math.ceil(story.content.split(/\s+/).length / 200);

  return (
    <div className="container mx-auto p-8 mb-32">
      <h1 className="text-3xl font-bold mb-12 text-left">{story.title}</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="w-1/3">
          <p className="text-lg">Reading time: {readingTime} min</p>
        </div>
        <div className="w-1/3 text-center">
          {story.tags.map((tag) => (
            <span key={tag} className="badge badge-primary mr-2 mb-2 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        <div className="w-1/3 text-right">
          <p className="text-lg">Published on {new Date(story.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      <ReactQuill
        value={story.content}
        readOnly={true}
        theme="bubble"
        className="p-8 custom-quill bg-teal-950 outline shadow-lg rounded-2xl"
      />
    </div>
  );
};

export default StoryVisualizer;
