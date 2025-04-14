import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';

const NoteDetails = () => {
  const router = useRouter();

  const handleDelete = () => {
    // Implement the delete logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/notes')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Notes
          </button>
          <div className="flex space-x-4">
            <button
              onClick={handleDelete}
              className="flex items-center text-red-600 hover:text-red-900"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteDetails; 