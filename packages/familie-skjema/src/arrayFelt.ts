import { genererId } from './utils';
import deepEqual from 'deep-equal';

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';

import {
    defaultValidator,
    Felt,
    FeltState,
    NavBaseSkjemaProps,
    NavInputProps,
    ValiderFelt,
    Avhengigheter,
    Valideringsstatus,
} from './typer';
import { isChangeEvent } from './utils';

/**
 * Konfigurasjon for å opprette et felt.
 *
 * @verdi verdien til feltet med generisk Verdi type
 * @valideringsfunksjon optional valideringsfunksjon på feltet
 * @skalFeltetVises optional visningsfunksjon. Kan brukes dersom skjemaet
 * skjuler felter for bruker under gitte omstendigheter
 * @avhengigheter avhengighetene som brukes til validering og vis/skjul
 */
export interface FeltConfig<Verdi> {
    avhengigheter?: Avhengigheter;
    feltId?: string;
    skalFeltetVises?: (avhengigheter: Avhengigheter) => boolean;
    valideringsfunksjon?: ValiderFelt<Verdi>;
    verdier: Verdi[];
}

export function useArrayFelt<Verdi = string>({
    avhengigheter = {},
    feltId,
    skalFeltetVises,
    valideringsfunksjon,
    verdier,
}: FeltConfig<Verdi>): Felt<Verdi>[] {
    const initialFeltState: FeltState<Verdi>[] = verdier.map(
        (verdi: Verdi): FeltState<Verdi> => ({
            feilmelding: '',
            id: feltId ? feltId : genererId(),
            valider: valideringsfunksjon ? valideringsfunksjon : defaultValidator,
            valideringsstatus: Valideringsstatus.IKKE_VALIDERT,
            verdi,
        }),
    );

    const [felterState, settFelterState] = useState<FeltState<Verdi>[]>(initialFeltState);
    const [erSynlig, settErSynlig] = useState(
        skalFeltetVises ? skalFeltetVises(avhengigheter) : true,
    );

    const nullstill = () => {
        settFelterState(initialFeltState);
    };

    const validerOgSettFelt = (verdi: Verdi, id: string) => {
        const validertFelter = felterState.map((feltState: FeltState<Verdi>) => {
            if (id === feltState.id) {
                return feltState.valider(
                    {
                        ...feltState,
                        verdi,
                    },
                    avhengigheter,
                );
            } else {
                return feltState;
            }
        });

        if (!deepEqual(felterState, validertFelter)) {
            settFelterState(validertFelter);
        }
    };

    const hentAvhengighetArray = () => {
        return avhengigheter
            ? Object.values(avhengigheter).reduce((acc: [], avhengighet: any) => {
                  if (avhengighet instanceof Object && 'valideringsstatus' in avhengighet) {
                      return [...acc, (avhengighet as Felt<unknown>).verdi];
                  } else {
                      return [...acc, avhengighet];
                  }
              }, [])
            : [];
    };

    /**
     * Basert på avhengighetene til feltet håndterer vi vis/skjul
     * og nullstilling på feltet.
     */
    useEffect(() => {
        if (skalFeltetVises) {
            if (felterState.valideringsstatus !== Valideringsstatus.IKKE_VALIDERT) {
                nullstill();
            }
            settErSynlig(skalFeltetVises(avhengigheter));
        } else {
            validerOgSettFelt();
        }
    }, [...hentAvhengighetArray()]);

    const onChange = useCallback(
        (verdi: Verdi | ChangeEvent) => {
            const normalisertVerdi = isChangeEvent(verdi) ? verdi.target.value : verdi;

            validerOgSettFelt(normalisertVerdi as Verdi);
        },
        [validerOgSettFelt, settFelterState],
    );

    const hentNavInputProps = useCallback(
        (visFeilmelding: boolean): NavInputProps<Verdi> => ({
            feil: visFeilmelding ? felterState.feilmelding : undefined,
            id,
            onChange,
            value: felterState.verdi,
        }),
        [validerOgSettFelt, settFelterState],
    );

    const hentNavBaseSkjemaProps = useCallback(
        (visFeilmelding: boolean): NavBaseSkjemaProps<Verdi> => ({
            feil: visFeilmelding ? felterState.feilmelding : undefined,
            id,
            value: felterState.verdi,
        }),
        [validerOgSettFelt, settFelterState],
    );

    return useMemo(
        () => ({
            ...felterState,
            id,
            hentNavInputProps,
            hentNavBaseSkjemaProps,
            nullstill,
            erSynlig,
            onChange,
            validerOgSettFelt,
        }),
        [felterState, hentNavInputProps, validerOgSettFelt, nullstill, onChange],
    );
}
