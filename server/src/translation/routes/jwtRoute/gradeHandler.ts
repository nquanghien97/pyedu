import { Request, Response } from 'express';
import { gradeRepository } from '../../database/grade.repo';
import { createGradeSchema, updateGradeSchema } from '../../../entities/grade';

export const getGrades = async (req: Request, res: Response): Promise<void> => {
  try {
    const grades = await gradeRepository.findMany(true);
    res.status(200).json({ success: true, data: grades });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch grades' });
  }
};

export const getGradeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const grade = await gradeRepository.findById(id as string);
    if (!grade) {
      res.status(404).json({ success: false, error: 'Grade not found' });
      return;
    }
    res.status(200).json({ success: true, data: grade });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch grade' });
  }
};

export const createGrade = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = createGradeSchema.parse(req.body);
    const newGrade = await gradeRepository.create(data);
    res.status(201).json({ success: true, data: newGrade });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ success: false, error: JSON.parse(error.message) });
      return;
    }
    res.status(500).json({ success: false, error: 'Failed to create grade' });
  }
};

export const updateGrade = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = updateGradeSchema.parse(req.body);
    const updatedGrade = await gradeRepository.update(id as string, data);
    res.status(200).json({ success: true, data: updatedGrade });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ success: false, error: JSON.parse(error.message) });
      return;
    }
    res.status(500).json({ success: false, error: 'Failed to update grade' });
  }
};

export const deleteGrade = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await gradeRepository.delete(id as string);
    res.status(200).json({ success: true, message: 'Grade deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete grade' });
  }
};
