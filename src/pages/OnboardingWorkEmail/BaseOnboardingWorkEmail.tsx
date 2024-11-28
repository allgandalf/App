import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import OfflineIndicator from '@components/OfflineIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import navigateAfterOnboarding from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';

import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/WorkEmailForm';
import IconAsset from '@src/types/utils/IconAsset';
import type {BaseOnboardingWorkEmailProps} from './types';
import { PUBLIC_DOMAINS, Str } from 'expensify-common';

function BaseOnboardingWorkEmail({shouldUseNativeStyles, route}: BaseOnboardingWorkEmailProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID);
    const [onboardingAdminsChatReportID] = useOnyx(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID);
    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [workEmail] = useOnyx(ONYXKEYS.ONBOARDING_WORK_EMAIL)
    console.log("workEmail", workEmail)

    const isVsb = onboardingValues && 'signupQualifier' in onboardingValues && onboardingValues.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;
    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {inputCallbackRef} = useAutoFocusInput();
    const [shouldValidateOnChange, setShouldValidateOnChange] = useState(false);
    const {isOffline} = useNetwork();
    const {canUseDefaultRooms} = usePermissions();
    const {activeWorkspaceID} = useActiveWorkspace();

    useEffect(() => {
        Welcome.setOnboardingErrorMessage('');
    }, []);

    const validatePrivateDomain = useCallback(
        (values: FormOnyxValues<'onboardingWorkEmailForm'>) => {


            Welcome.setOnboardingWorkEmail(values[INPUT_IDS.WORK_EMAIL])

            

        },
        [onboardingPurposeSelected, onboardingAdminsChatReportID, onboardingPolicyID, route.params?.backTo, activeWorkspaceID, canUseDefaultRooms, isSmallScreenWidth, shouldUseNarrowLayout],
    );

    const validate = (values: FormOnyxValues<'onboardingWorkEmailForm'>) => {
        if (!shouldValidateOnChange) {
            setShouldValidateOnChange(true);
        }
        const userEmail = values[INPUT_IDS.WORK_EMAIL]
        

        const errors = {};
        const emailParts = userEmail.split('@');
        const domain = emailParts.at(1) ?? '';


        if(PUBLIC_DOMAINS.some((publicDomain) => publicDomain === domain.toLowerCase()) || !Str.isValidEmail(userEmail)){
            ErrorUtils.addErrorMessage(errors, 'workEmail', 'Please enter a valid work email from a private domain e.g. mitch@company.com')
        }
        
        return errors;
    };

    type Item = {
        icon: IconAsset;
        titleTranslationKey: TranslationPaths;
    };

    type SectionObject = {
        titleTranslationKey: TranslationPaths;
        subtitleTranslationKey: TranslationPaths;
        items: Item[];
    };

    const section: SectionObject[] = [
        {
            titleTranslationKey: 'onboarding.workEmail.title',
            subtitleTranslationKey: 'onboarding.workEmail.subtitle',
            items: [
                {
                    icon: Illustrations.EnvelopeReceipt,
                    titleTranslationKey: 'onboarding.workEmail.explanationModal.descriptionOne',
                },
                {
                    icon: Illustrations.Profile,
                    titleTranslationKey: 'onboarding.workEmail.explanationModal.descriptionTwo',
                },
                {
                    icon: Illustrations.Gears,
                    titleTranslationKey: 'onboarding.workEmail.explanationModal.descriptionThree',
                },
            ],
        },
    ];

    const renderItem = useCallback(
        (item: Item) => (
            <View
                key={item.titleTranslationKey}
                style={[styles.mt2, styles.mb3]}
            >
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}>
                    <Icon
                        src={item.icon}
                        height={ICON_SIZE}
                        width={ICON_SIZE}
                        additionalStyles={[styles.mr3]}
                    />
                    <View style={[styles.flexColumn, styles.flex1]}>
                        <Text style={[styles.textStrong, styles.lh20]}>{translate(item.titleTranslationKey)}</Text>
                    </View>
                </View>
            </View>
        ),
        [styles, translate],
    );

    const renderSection = useCallback(
        (section: SectionObject) => (
            <View>
                <View style={[onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb3]}>
                    <Text style={styles.textHeadlineH1}>{`What's your work email?`}</Text>
                </View>
                <View style={styles.mb2}>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{'Expensify works best when you connect your work email.'}</Text>
                </View>
                <View>{section.items.map(renderItem)}</View>
            </View>
        ),
        [shouldUseNarrowLayout, styles, renderItem, translate],
    );

    const ICON_SIZE = 48;

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            shouldShowOfflineIndicator={false}
            includeSafeAreaPaddingBottom={isOffline}
            testID="BaseOnboardingPersonalDetails"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                progressBarPercentage={1}
                onBackButtonPress={Navigation.goBack}
                shouldShowBackButton={false}
            />
            <FormProvider
                style={[styles.flexGrow1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}
                formID={ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM}
                validate={validate}
                onSubmit={validatePrivateDomain}
                submitButtonText={'Continue'}
                enabledWhenOffline
                submitFlexEnabled
                shouldValidateOnBlur={false}
                shouldValidateOnChange={shouldValidateOnChange}
                shouldTrimValues={false}
                footerContent={
                    <View style={styles.mb2}>
                        <Button
                            large
                            text="Skip this for now"
                            onPress={() => {
                                if (isVsb) {
                                    Navigation.navigate(ROUTES.ONBOARDING_ACCOUNTING.getRoute());
                                    return;
                                }
                                Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute());
                            }}
                        />
                    </View>
                }
                shouldRenderFooterAboveSubmit
            >
                {section.map(renderSection)}


                <View style={[styles.mb4, styles.pt3]}>
                    <InputWrapper
                        InputComponent={TextInput}
                        ref={inputCallbackRef}
                        inputID={INPUT_IDS.WORK_EMAIL}
                        name="fname"
                        label={'Work email'}
                        aria-label={'Work email'}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue={'wow'}
                        shouldSaveDraft
                        maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                        spellCheck={false}
                    />
                </View>
                {/* The below button would be displayed aboe the submit button */}
            </FormProvider>
            {isSmallScreenWidth && <OfflineIndicator />}
        </ScreenWrapper>
    );
}

BaseOnboardingWorkEmail.displayName = 'BaseOnboardingWorkEmail';

export default BaseOnboardingWorkEmail;
