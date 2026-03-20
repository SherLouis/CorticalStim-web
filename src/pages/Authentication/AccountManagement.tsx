import {
  Container,
  PasswordInput,
  Button,
  Title,
  PaperProps,
  Paper,
  Accordion,
  TextInput,
  Checkbox,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { isPasswordSecure } from './Password';
import { useAuthState } from '../../context/AuthContext';
import AuthenticationError, { AuthenticationErrorReason } from '../../core/auth/authenticationError';
import { notifications } from '@mantine/notifications';
import { IconTrash } from '@tabler/icons-react';

const AccountManagementPage = (props: PaperProps) => {
  // TODO: ajouter option pour supprimer le compte

  const { t } = useTranslation();

  const { authProvider, user } = useAuthState();

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

  const setDisplayNameForm = useForm({
    initialValues: {
      displayName: user ? user.displayName : ''
    },
    validate: {
      displayName: (newDisplayName) => newDisplayName === user?.displayName ? t('pages.accountManagement.displayNameChange.validations.same_as_current') : null
    },
    validateInputOnChange: true
  })

  const deleteAccountForm = useForm({
    initialValues: {
      confirm: false,
      password: ''
    },
    validate: {
      confirm: (confirmed) => !confirmed ? t('pages.accountManagement.delete_account.validations.not_confirmed') : null
    }
  })

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

  const handleSetDisplayName = () => {
    authProvider.setDisplayName(setDisplayNameForm.values.displayName)
      .then(() => {
        console.log('Display name changed');
        notifications.show({
          id: 'display_name_changed',
          title: t('pages.accountManagement.displayNameChange.notifications.success_title'),
          message: t('pages.accountManagement.displayNameChange.notifications.success_body'),
          color: "green"
        });
      })
      .catch(() => {
        notifications.show({
          id: 'display_name_changed',
          title: t('pages.accountManagement.displayNameChange.notifications.failure_title'),
          message: t('pages.accountManagement.displayNameChange.notifications.failure_body'),
          color: "red"
        });
      })
  }

  const handlerDeleteAccount = () => {
    authProvider.deleteAccount(deleteAccountForm.values.password)
      .then(() => {
        console.log('Account deleted');
        notifications.show({
          id: 'delete_account',
          title: t('pages.accountManagement.delete_account.notifications.success_title'),
          message: t('pages.accountManagement.delete_account.notifications.success_body'),
          color: "green"
        });
        deleteAccountForm.reset();
      })
      .catch((error: AuthenticationError) => {
        console.error(error.reason);
        notifications.show({
          id: 'delete_account',
          title: t('pages.accountManagement.delete_account.notifications.failure_title'),
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

          <Accordion.Item value='display_name_change'>
            <Accordion.Control>{t('pages.accountManagement.displayNameChange.title')}</Accordion.Control>
            <Accordion.Panel>
              <form onSubmit={setDisplayNameForm.onSubmit(handleSetDisplayName)}>
                <TextInput
                  label={t('pages.accountManagement.displayNameChange.new_display_name')}
                  required
                  {...setDisplayNameForm.getInputProps('displayName')}
                />
                <Button type='submit' disabled={!setDisplayNameForm.isValid()}>{t('common.okButtonLabel')}</Button>
              </form>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value='delete_account'>
            <Accordion.Control>{t('pages.accountManagement.delete_account.title')}</Accordion.Control>
            <Accordion.Panel>
              <form onSubmit={deleteAccountForm.onSubmit(handlerDeleteAccount)}>
                <Checkbox
                  label={t('pages.accountManagement.delete_account.confirm_deletion')}
                  required
                  {...deleteAccountForm.getInputProps('confirm')}
                />
                <PasswordInput
                  label={t('pages.accountManagement.delete_account.password')}
                  required
                  {...deleteAccountForm.getInputProps('password')}
                />
                <Button type='submit' disabled={!deleteAccountForm.isValid()} color='red' leftSection={<IconTrash />}>
                  {t('pages.accountManagement.delete_account.title')}
                </Button>
              </form>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

      </Container>
    </Paper>
  );
};

export default AccountManagementPage;
