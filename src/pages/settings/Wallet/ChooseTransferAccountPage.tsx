import React, {useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx, withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import getBankIcon from '@components/Icon/BankIcons';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import * as CardUtils from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as BankAccounts from '@userActions/BankAccounts';
import * as PaymentMethods from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {AccountData, WalletTransfer} from '@src/types/onyx';
import type {BankName} from '@src/types/onyx/Bank';
import PaymentMethodList from './PaymentMethodList';

type ChooseTransferAccountPageOnyxProps = {
    /** Wallet transfer propTypes */
    walletTransfer: OnyxEntry<WalletTransfer>;
};

type ChooseTransferAccountPageProps = ChooseTransferAccountPageOnyxProps;

function ChooseTransferAccountPage({walletTransfer = {}}: ChooseTransferAccountPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    /**
     * Go back to transfer balance screen with the selected bank account set
     * @param event Click event object
     * @param accountType of the selected account type
     * @param account of the selected account data
     */
    const selectAccountAndNavigateBack = (event?: GestureResponderEvent | KeyboardEvent, accountType?: string, account?: AccountData) => {
        PaymentMethods.saveWalletTransferAccountTypeAndID(
            accountType ?? '',
            (accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT ? account?.bankAccountID?.toString() : account?.fundID?.toString()) ?? '',
        );
        console.log('reached hereeee')
        Navigation.goBack(ROUTES.SETTINGS_WALLET_TRANSFER_BALANCE);
    };

    const navigateToAddPaymentMethodPage = () => {
        if (walletTransfer?.filterPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_DEBIT_CARD);
            return;
        }
        BankAccounts.openPersonalBankAccountSetupView();
    };

    const [bankAccountsList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const data = useMemo(() => {
        const options = Object.values(bankAccountsList || {}).map((bankAccount) => {
            const bankName = (bankAccount.accountData?.additionalData?.bankName ?? '') as BankName;
            const bankAccountNumber = bankAccount.accountData?.accountNumber ?? '';
            const bankAccountID = bankAccount.accountData?.bankAccountID ?? bankAccount.methodID;
            console.log('bankAccount', bankAccount)
            const {icon, iconSize, iconStyles} = getBankIcon({bankName, styles});
            return {
                value: bankAccountID,
                text: bankAccount.title,
                leftElement: icon && (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.mr3]}>
                        <Icon
                            src={icon}
                            width={iconSize}
                            height={iconSize}
                            additionalStyles={iconStyles}
                        />
                    </View>
                ),
                alternateText: `${translate('workspace.expensifyCard.accountEndingIn')} ${getLastFourDigits(bankAccountNumber)}`,
                keyForList: bankAccountID?.toString(),
                isSelected: bankAccountID?.toString() === walletTransfer?.selectedAccountID,
                bankAccount: bankAccount
            };
        });
        return options;
    }, [bankAccountsList, walletTransfer?.selectedAccountID, styles, translate]);

    return (
        <ScreenWrapper testID={ChooseTransferAccountPage.displayName}>
            <HeaderWithBackButton
                title={translate('chooseTransferAccountPage.chooseAccount')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET_TRANSFER_BALANCE)}
            />
            <View style={[styles.mt3, styles.flexShrink1, styles.flexBasisAuto]}>
                <SelectionList
                    sections={[{data}]}
                    ListItem={RadioListItem}
                    onSelectRow={(value) => {
                        const accountType = value?.bankAccount?.accountType
                        const accountData = value?.bankAccount?.accountData
                        selectAccountAndNavigateBack(undefined, accountType, accountData  )}}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedOptionKey={walletTransfer?.selectedAccountID?.toString()}
                />
            </View>
            <MenuItem
                onPress={navigateToAddPaymentMethodPage}
                title={
                    walletTransfer?.filterPaymentMethodType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT
                        ? translate('paymentMethodList.addNewBankAccount')
                        : translate('paymentMethodList.addNewDebitCard')
                }
                icon={Expensicons.Plus}
            />
        </ScreenWrapper>
    );
}

ChooseTransferAccountPage.displayName = 'ChooseTransferAccountPage';

export default withOnyx<ChooseTransferAccountPageProps, ChooseTransferAccountPageOnyxProps>({
    walletTransfer: {
        key: ONYXKEYS.WALLET_TRANSFER,
    },
})(ChooseTransferAccountPage);
