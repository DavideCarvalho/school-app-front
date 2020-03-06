import React, { useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useHistory } from 'react-router-dom';
import { FormField } from '../../components';
import { loginUser } from './LoginForm.service';

interface LoginForm {
  email: string;
  password: string;
}

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email('Email precisa ser um email válido')
    .required('Email é obrigatório'),
  password: Yup.string()
    .trim()
    .required('Senha é obrigatória'),
});

export const LoginForm: React.FC = () => {
  const history = useHistory();
  const [showUserNotFound, setshowUserNotFound] = useState(false);
  const { errors, handleSubmit, handleChange, values } = useFormik<LoginForm>({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: async ({ email, password }) => {
      setshowUserNotFound(false);
      try {
        await loginUser(email, password);
        history.push('school/dashboard');
      } catch (e) {
        if (e.code === 'auth/user-not-found') {
          setshowUserNotFound(true);
        }
      }
    },
  });
  return (
    <form onSubmit={handleSubmit}>
      <FormField
        id="email"
        name="email"
        title="Email"
        type="email"
        placeholder="some@email.com"
        iconCode="fa-user"
        onChange={handleChange}
        className="text-colors"
        value={values.email}
        error={errors.email}
      />
      <FormField
        id="password"
        name="password"
        title="Password"
        type="password"
        iconCode="fa-key"
        onChange={handleChange}
        className="text-colors"
        value={values.password}
        error={errors.password}
      />
      {showUserNotFound && (
        <p className="help is-danger has-text-weight-bold has-text-centered">Usuário não encontrado</p>
      )}
      <button className="button is-light is-info is-fullwidth" type="submit">
        Entrar
      </button>
    </form>
  );
};
