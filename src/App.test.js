import React from 'react';
import { render } from '@testing-library/react';
// import App from './App';
import DifficultyInput from 'components/post/draft/sub-components/difficulty-input';
// import { authMock } from 'tests/mocks/withAuthentication.test';

test('renders learn react link', () => {
  const { getByText } = render(
    <DifficultyInput
      difficulty={"Hard"}
      setDifficulty={() => console.log('Clicked')}
      displayDifficulty={(val) => val}
    />);
  const linkElement = getByText(/Difficulty/i);
  expect(linkElement).toBeInTheDocument();
});
