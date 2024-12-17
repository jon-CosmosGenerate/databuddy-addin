// src/services/contribution/types.ts
export interface IContributor {
  id: string;
  name: string;
  email: string;
  title?: string;
  company?: string;
  verificationStatus: 'pending' | 'verified' | 'expert';
  verificationDetails: {
    method: 'professional' | 'government' | 'academic';
    verifiedAt: Date;
    verifier?: string;
  };
  contributionStats: {
    totalContributions: number;
    acceptedContributions: number;
    verifiedContributions: number;
    reputation: number;
  };
}

export interface DataContribution {
  id: string;
  contributorId: string;
  entityType: 'company' | 'person' | 'transaction' | 'event';
  entityId: string;
  dataType: 'financial' | 'operational' | 'governance' | 'relationship' | 'insight';
  content: {
    data: any;
    source: 'public' | 'professional' | 'direct' | 'whistleblower';
    sourceDetails?: string;
    evidence?: string[];
  };
  status: 'pending' | 'under_review' | 'accepted' | 'rejected' | 'flagged';
  visibility: 'public' | 'private' | 'anonymous';
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    reviewedBy?: string[];
    verifiedBy?: string[];
    confidenceScore: number;
    impactScore: number;
  };
}

export interface IContributionReview {
  id: string;
  contributionId: string;
  reviewerId: string;
  verdict: 'approve' | 'reject' | 'flag' | 'need_more_info';
  confidence: number;
  reasoning: string;
  suggestedEdits?: any;
  metadata: {
    reviewedAt: Date;
    reviewerReputation: number;
    reviewTime: number;
  };
}