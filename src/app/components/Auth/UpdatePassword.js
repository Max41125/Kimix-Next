import React, { useState } from 'react';
import axios from 'axios';

const UpdatePassword = ({ userToken, userEmail}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const csrfUrl = process.env.NEXT_PUBLIC_CSRF_URL;

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Новый пароль и подтверждение не совпадают.');
      return;
    }

    try {

        await axios.get(csrfUrl, { withCredentials: true });


      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/update-password`,
        {
          email: userEmail,
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          withCredentials: true,
          withXSRFToken:true,
        }
      );

      setMessage(response.data.message);
      setError(response.data.error);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Произошла ошибка');
    }
  };

  return (
    <div className="mt-4 lg:p-4 p-2 border rounded-lg bg-white">
      <h2 className="text-lg font-bold">Сброс пароля</h2>
      <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4">
        <div>
          <label className="block mb-1 font-medium">Текущий пароль:</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Новый пароль:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Подтвердите новый пароль:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
            required
          />
        </div>
        {message && <p className="text-green-500">{message}</p>}
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">
          Обновить пароль
        </button>
      </form>
    </div>
  );
};

export default UpdatePassword;
