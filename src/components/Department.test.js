import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Department from './Department';

// Mock data for testing
const mockDepartment = {
  id: 1,
  name: 'Cardiology',
  staffCount: 25,
  totalBeds: 50,
  occupancy: 75,
  waitingPatients: 12,
  status: 'busy',
  specializations: [
    { id: 1, name: 'General Cardiology' },
    { id: 2, name: 'Interventional Cardiology' }
  ]
};

describe('Department Component', () => {
  test('renders department information correctly', () => {
    render(<Department department={mockDepartment} />);
    
    // Check if department name is displayed
    expect(screen.getByText('Cardiology')).toBeInTheDocument();
    
    // Check if status is displayed
    expect(screen.getByText('BUSY')).toBeInTheDocument();
    
    // Check if staff count is displayed
    expect(screen.getByText('25')).toBeInTheDocument();
    
    // Check if bed capacity is displayed
    expect(screen.getByText('75% of 50')).toBeInTheDocument();
    
    // Check if waiting list is displayed
    expect(screen.getByText('12 patients')).toBeInTheDocument();
    
    // Check if current load is displayed
    expect(screen.getByText('Medium')).toBeInTheDocument();
    
    // Check if specializations are displayed
    expect(screen.getByText('General Cardiology')).toBeInTheDocument();
    expect(screen.getByText('Interventional Cardiology')).toBeInTheDocument();
  });

  test('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<Department department={mockDepartment} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByText('Edit Department'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockDepartment);
  });

  test('calls onDelete when delete button is clicked', () => {
    const mockOnDelete = jest.fn();
    render(<Department department={mockDepartment} onDelete={mockOnDelete} />);
    
    fireEvent.click(screen.getByText('Remove Department'));
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  test('does not render action buttons when showActions is false', () => {
    render(<Department department={mockDepartment} showActions={false} />);
    
    expect(screen.queryByText('Edit Department')).not.toBeInTheDocument();
    expect(screen.queryByText('Remove Department')).not.toBeInTheDocument();
  });

  test('handles null department gracefully', () => {
    const { container } = render(<Department department={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
