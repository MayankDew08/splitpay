'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Plus, X, Users } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, members: string[]) => void;
  userAddress: string;
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  onSubmit,
  userAddress,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState<string[]>([userAddress]);

  const addMember = () => {
    if (memberInput && !members.includes(memberInput)) {
      setMembers([...members, memberInput]);
      setMemberInput('');
    }
  };

  const removeMember = (address: string) => {
    if (address !== userAddress) {
      setMembers(members.filter((m) => m !== address));
    }
  };

  const handleSubmit = () => {
    if (groupName && members.length > 0) {
      onSubmit(groupName, members);
      setGroupName('');
      setMembers([userAddress]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Create New Group
              </CardTitle>
              <CardDescription>Set up a new expense sharing group</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Group Name
            </label>
            <Input
              placeholder="e.g., Weekend Trip, Dinner Party"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Add Members
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Stellar address (G...)"
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addMember()}
              />
              <Button onClick={addMember} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {members.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm font-mono text-gray-700 truncate">
                    {member === userAddress ? `${member} (You)` : member}
                  </span>
                  {member !== userAddress && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(member)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!groupName || members.length === 0}
              className="flex-1"
            >
              Create Group
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
