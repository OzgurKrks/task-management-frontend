import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { axiosPrivate } from "@/lib/axiosConfig";

interface Member {
  _id: string;
  name: string;
  email: string;
}

interface ProjectMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onProjectUpdated?: () => void;
}

export default function ProjectMembersModal({
  isOpen,
  onClose,
  projectId,
  onProjectUpdated,
}: ProjectMembersModalProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [availableUsers, setAvailableUsers] = useState<Member[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchProjectMembers();
      fetchAvailableUsers();
    }
  }, [isOpen, projectId]);

  const fetchProjectMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axiosPrivate.get(`/projects/${projectId}/members`);
      setMembers(response.data);
    } catch (err) {
      console.error("Failed to fetch project members:", err);
      setError("Could not load project members");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await axiosPrivate.get("/users");
      setAvailableUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch available users:", err);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;

    try {
      setIsLoading(true);
      setError(null);
      await axiosPrivate.post(`/projects/${projectId}/members`, {
        userId: selectedUserId,
      });

      // Refresh members list
      await fetchProjectMembers();
      setSelectedUserId("");

      if (onProjectUpdated) {
        onProjectUpdated();
      }
    } catch (err) {
      console.error("Failed to add member:", err);
      setError("Could not add member to project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await axiosPrivate.delete(`/projects/${projectId}/members/${memberId}`);

      // Refresh members list
      await fetchProjectMembers();

      if (onProjectUpdated) {
        onProjectUpdated();
      }
    } catch (err) {
      console.error("Failed to remove member:", err);
      setError("Could not remove member from project");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filter out users who are already members
  const filteredUsers = availableUsers.filter(
    (user) => !members.some((member) => member._id === user._id)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Project Members</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Add new member form */}
        <div className="mb-6">
          <label
            htmlFor="member"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Add Member
          </label>
          <div className="flex space-x-2">
            <select
              id="member"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex-grow border rounded-md px-3 py-2"
              disabled={isLoading || filteredUsers.length === 0}
            >
              <option value="">Select a user</option>
              {filteredUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <button
              onClick={handleAddMember}
              disabled={!selectedUserId || isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        {/* Current members list */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Current Members
          </h4>
          {isLoading && members.length === 0 ? (
            <div className="flex justify-center my-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : members.length > 0 ? (
            <ul className="divide-y">
              {members.map((member) => (
                <li
                  key={member._id}
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    className="text-xs text-red-600 hover:text-red-800"
                    disabled={isLoading}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No members added to this project yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
