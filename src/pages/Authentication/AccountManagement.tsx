import {
  Container,
  PasswordInput,
  Button,
  Title,
  PaperProps,
  Paper,
  Accordion,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { isPasswordSecure } from './Password';
import { useAuthState } from '../../context/AuthContext';
import AuthenticationError, { AuthenticationErrorReason } from '../../core/auth/authenticationError';
import { notifications } from '@mantine/notifications';

const AccountManagementPage = (props: PaperProps) => {
  // TODO: ajouter changement de nom d'utilisateur
  // TODO: ajouter option pour supprimer le compte

  const { t } = useTranslation();

  const { authProvider } = useAuthState();

  const changePasswordForm = useForm({
    initialValues: {
      existingPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    },
    validate: {
      newPassword: (val) => (!isPasswordSecure(val) ? t('pages.accountManagement.password_change.validations.password_requirements') : null),
      confirmNewPassword: (value, values) => (value !== values.newPassword ? t('pages.accountManagement.password_change.validations.passwords_do_not_match') : null),
    },
    validateInputOnChange: true
  });

  const getAuthErrorAlertMessage = (authError: AuthenticationError) => {
    switch (authError.reason) {
        case AuthenticationErrorReason.INVALID_LOGIN_CREDENTIALS:
            return t('pages.accountManagement.password_change.notifications.auth_errors.invalid_credentials');
        default:
          return t('pages.accountManagement.password_change.notifications.auth_errors.other_error');
    }
}
  const handleChangePassword = () => {
    authProvider.changePassword(changePasswordForm.values.existingPassword, changePasswordForm.values.newPassword)
      .then(() => {
        console.log('Password changed');
        notifications.show({
          id: 'password_changed',
          title: t('pages.accountManagement.password_change.notifications.success_title'),
          message: t('pages.accountManagement.password_change.notifications.success_body'),
          color: "green"
        });
        changePasswordForm.reset();
      })
      .catch((error: AuthenticationError) => {
        console.error(error.reason);
        notifications.show({
          id: 'password_changed',
          title: t('pages.accountManagement.password_change.notifications.failure_title'),
          message: getAuthErrorAlertMessage(error),
          color: "red"
        });
      })
  }

  return (
    <Paper radius="md" p="xl" withBorder {...props}>
      <Container>
        <Title order={2}>{t('pages.accountManagement.manage_account')}</Title>

        <Accordion>
          <Accordion.Item value='password_change'>
            <Accordion.Control>{t('pages.accountManagement.password_change.title')}</Accordion.Control>
            <Accordion.Panel>
              <form onSubmit={changePasswordForm.onSubmit(handleChangePassword)}>
                <PasswordInput
                  label={t('pages.accountManagement.password_change.current_password')}
                  required
                  {...changePasswordForm.getInputProps('existingPassword')}
                />
                <PasswordInput
                  label={t('pages.accountManagement.password_change.new_password')}
                  {...changePasswordForm.getInputProps('newPassword')}
                  required
                />
                <PasswordInput
                  label={t('pages.accountManagement.password_change.confirm_new_password')}
                  {...changePasswordForm.getInputProps('confirmNewPassword')}
                  required
                />
                <Button type="submit" disabled={!changePasswordForm.isValid()}>{t('common.okButtonLabel')}</Button>
              </form>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

      </Container>
    </Paper>
  );
};

export default AccountManagementPage;
