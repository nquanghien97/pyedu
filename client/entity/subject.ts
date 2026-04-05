export interface SubjectEntity {
  id: string;
  name: string;
  grade?: number | null;
  parentSubjectId: string | null;
  createdAt: string;
  updatedAt: string;
  children?: SubjectEntity[];
  topics?: TopicEntity[];
}

export interface TopicEntity {
  id: string;
  subjectId: string;
  name: string;
  orderIndex: number | null;
  parentTopicId: string | null;
  createdAt: string;
  updatedAt: string;
  children?: TopicEntity[];
}
