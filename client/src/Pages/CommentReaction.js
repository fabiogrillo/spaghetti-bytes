// client/src/Pages/CommentReaction.js
import React, { useEffect, useState } from 'react';
import api from '../Api';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaTrash, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CommentReaction = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/comments/moderate');
        setComments(res.data.comments || []);
      } catch (error) {
        toast.error('Error loading comments to moderate');
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [navigate]);

  const handleApprove = async (id) => {
    try {
      await api.post(`/comments/${id}/approve`);
      setComments(comments.filter(c => c._id !== id));
      toast.success('Comment approved!');
    } catch {
      toast.error('Error on comment approval');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/comments/${id}/admin`);
      setComments(comments.filter(c => c._id !== id));
      toast.success('Comment deleted!');
    } catch {
      toast.error('Error on comment deletion');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><FaSpinner className="animate-spin text-4xl text-error" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Comment Moderation</h1>
      {comments.length === 0 ? (
        <p className="text-gray-500">There are not comment to moderate.</p>
      ) : (
        <ul className="space-y-6">
          {comments.map(comment => (
            <li key={comment._id} className="bg-white rounded-soft shadow-soft-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-secondary">{comment.author.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs text-white ${comment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`}>{comment.status}</span>
              </div>
              <div className="mb-2 text-gray-700">{comment.content}</div>
              <div className="flex gap-2">
                <button className="btn btn-success btn-sm" onClick={() => handleApprove(comment._id)}><FaCheck /> Approve</button>
                <button className="btn btn-error btn-sm" onClick={() => handleDelete(comment._id)}><FaTrash /> Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CommentReaction;
