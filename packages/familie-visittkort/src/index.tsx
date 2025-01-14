import Clipboard from '@navikt/familie-clipboard';
import { FamilieIkonVelger } from '@navikt/familie-ikoner';
import { kjønnType } from '@navikt/familie-typer';
import Element, { Normaltekst } from 'nav-frontend-typografi';
import * as React from 'react';

import './index.less';

export interface IProps {
    alder: number;
    ident: string;
    kjønn: kjønnType;
    navn: string | React.ReactNode;
}

export const Visittkort: React.StatelessComponent<IProps> = ({ alder, children, ident, kjønn, navn }) => {
    return (
        <div className={'visittkort'}>
            <FamilieIkonVelger className={'visittkort__ikon'} alder={alder} kjønn={kjønn} />
            {typeof navn === 'string' ? <Element type={'element'}>{navn}</Element> : navn}

            <div className={'visittkort__pipe'}>|</div>

            <Clipboard>
                <Normaltekst>{ident}</Normaltekst>
            </Clipboard>

            {children}
        </div>
    );
};

export default Visittkort;
