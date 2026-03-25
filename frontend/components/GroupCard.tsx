'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Users, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { formatAmount } from '@/lib/utils';
import { Group } from '@/lib/stellar';

interface GroupCardProps {
  group: Group & { id: number };
  onClick: () => void;
}

export default function GroupCard({ group, onClick }: GroupCardProps) {
  return (
    <Card
      className="cursor-pointer hover:scale-105 transition-transform"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{group.name}</CardTitle>
          {group.is_settled ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Clock className="w-5 h-5 text-yellow-600" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{group.total_members} members</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span className="font-semibold text-lg text-gray-900">
              {formatAmount(group.total_paid)} XLM
            </span>
          </div>
          <div className="pt-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                group.is_settled
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {group.is_settled ? 'Settled' : 'Active'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
