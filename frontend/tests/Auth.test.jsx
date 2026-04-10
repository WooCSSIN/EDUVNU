import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import Auth from '../src/pages/Auth';
import { expect, test, describe } from 'vitest';

describe('Auth Page', () => {
  const renderAuth = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Auth />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test('renders with the correct heading', () => {
    renderAuth();
    expect(screen.getByText('Học không giới hạn')).toBeInTheDocument();
  });

  test('switches between Login and Register modes', () => {
    renderAuth();
    const switchBtn = screen.getByText(/Chưa có tài khoản\? Đăng ký ngay/i);
    fireEvent.click(switchBtn);
    expect(screen.getByText('Tham gia cùng hàng triệu học viên')).toBeInTheDocument();
  });
});
