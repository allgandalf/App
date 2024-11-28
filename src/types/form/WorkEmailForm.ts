import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    WORK_EMAIL: 'workEmail',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkEmailForm = Form<
    InputID,
    {
        [INPUT_IDS.WORK_EMAIL]: string;
    }
>;

export type {WorkEmailForm};
export default INPUT_IDS;
