import React from 'react';
import BaseOnboardingWorkEmail from './BaseOnboardingWorkEmail';
import type {OnboardingWorkEmailProps} from './types';

function OnboardingWorkEmail({...rest}: OnboardingWorkEmailProps) {
    return (
        <BaseOnboardingWorkEmail
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

OnboardingWorkEmail.displayName = 'OnboardingWorkEmail';

export default OnboardingWorkEmail;
