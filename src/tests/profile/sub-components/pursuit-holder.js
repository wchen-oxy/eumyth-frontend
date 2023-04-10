import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import PursuitHolder from 'components/profile/sub-components/pursuit-holder';

test('', () => {
    const testMessage = '3 Posts';
    render(<PursuitHolder numEvents={3} />)
    expect(screen.getByText(testMessage)).toBeInTheDocument()
})