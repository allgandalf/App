import React from 'react';
import {View} from 'react-native';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import useThemeStyles from '@hooks/useThemeStyles';
import BaseOnboardingWorkEmail from './BaseOnboardingWorkEmail';
import type {OnboardingWorkEmailProps} from './types';

function OnboardingWorkEmail({...rest}: OnboardingWorkEmailProps) {
    const styles = useThemeStyles();

    return (
        <FocusTrapForScreens>
            <View style={styles.h100}>
                <BaseOnboardingWorkEmail
                    shouldUseNativeStyles={false}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rest}
                />
            </View>
        </FocusTrapForScreens>
    );
}

OnboardingWorkEmail.displayName = 'OnboardingWorkEmail';

export default OnboardingWorkEmail;
