import { Knapp } from 'nav-frontend-knapper';
import React, { useState } from 'react';
import '../../stories.less';
import { FamilieInput } from './FamilieInput';

export default {
    component: FamilieInput,
    parameters: {
        componentSubtitle: 'Et inputfelt med støtte for lesevisning.',
    },
    title: 'Komponenter/Form-elementer/FamilieInput',
};

export const FamilieInputStory: React.FC = ({...args}) => {
    const [lesevisning, settLesevisning] = useState(true);
    const [knappTekst, settKnappTekst] = useState('Fjern lesevisning');
    const [inputVerdi, settInputVerdi] = useState('Den satte verdien');

    const onClickToggleKnapp = () => {
        if (lesevisning) {
            settLesevisning(false);
            settKnappTekst('Vis med lesevisning');
        } else {
            settLesevisning(true);
            settKnappTekst('Fjern lesevisning');
        }
    };

    return (
        <>
            <div className={'story-elements'}>
                <Knapp onClick={onClickToggleKnapp}>{knappTekst}</Knapp>
            </div>
            <div className={'story-elements'}>
                <FamilieInput
                    erLesevisning={lesevisning}
                    bredde={'L'}
                    onChange={e => settInputVerdi(e.target.value)}
                    value={inputVerdi}
                    {...args}
                />
            </div>
        </>
    );
};
