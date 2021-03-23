import { genererId } from './utils';
import deepEqual from 'deep-equal';

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';

import {
    defaultValidator,
    Felt,
    FeltState,
    NavBaseSkjemaProps,
    ValiderFelt,
    Avhengigheter,
    Valideringsstatus,
    NavInputProps,
} from './typer';
import { isChangeEvent } from './utils';

/**
 * Konfigurasjon for å opprette en gruppe av felter.
 *
 * @verdier verdiene til feltene med generisk Verdi type
 * @valideringsfunksjon optional felles valideringsfunksjon på feltene
 * @skalFeltetVises optional visningsfunksjon. Kan brukes dersom skjemaet
 * skjuler felter for bruker under gitte omstendigheter
 * @avhengigheter avhengighetene som brukes til validering og vis/skjul
 */
export interface ArrayFeltConfig<Verdi> {
    avhengigheter?: Avhengigheter;
    feltId?: string;
    skalFeltetVises?: (avhengigheter: Avhengigheter) => boolean;
    valideringsfunksjon?: ValiderFelt<Verdi>;
    verdier: Verdi[];
}

export interface ArrayFelt<Verdi> {
    nullstill: () => void;
    leggTilFelt: (verdi: Verdi) => void;
    felter: Felt<Verdi>[];
}

export function useArrayFelt<Verdi = string>({
    avhengigheter = {},
    feltId,
    skalFeltetVises,
    valideringsfunksjon,
    verdier,
}: ArrayFeltConfig<Verdi>): Felt<Verdi>[] {
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

    const leggTilFelt = (verdi: Verdi) => {
        settFelterState([
            ...felterState,
            {
                feilmelding: '',
                id: feltId ? feltId : genererId(),
                valider: valideringsfunksjon ? valideringsfunksjon : defaultValidator,
                valideringsstatus: Valideringsstatus.IKKE_VALIDERT,
                verdi,
            },
        ]);
    };

    const refreshFelter = () => {
        settFelterState(
            felterState.map((feltState: FeltState<Verdi>) => {
                return feltState.valider(
                    {
                        ...feltState,
                        verdi: feltState.verdi,
                    },
                    avhengigheter,
                );
            }),
        );
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
            if (
                felterState.some(felt => felt.valideringsstatus !== Valideringsstatus.IKKE_VALIDERT)
            ) {
                nullstill();
            }
            settErSynlig(skalFeltetVises(avhengigheter));
        } else {
            refreshFelter();
        }
    }, [...hentAvhengighetArray()]);

    const onChange = useCallback(
        (verdi: Verdi | ChangeEvent, id: string) => {
            const normalisertVerdi = isChangeEvent(verdi) ? verdi.target.value : verdi;

            validerOgSettFelt(normalisertVerdi as Verdi, id);
        },
        [validerOgSettFelt, settFelterState],
    );

    const hentNavInputProps = useCallback(
        (visFeilmelding: boolean, id: string): NavInputProps<Verdi> => {
            const feltState: FeltState<Verdi> | undefined = felterState.find(
                felt => felt.id === id,
            );
            if (!feltState) throw Error(`Fant ikke felt med id ${id} i listen av felter`);

            return {
                feil: visFeilmelding ? feltState.feilmelding : undefined,
                id: feltState.id,
                onChange: (verdi: Verdi | ChangeEvent) => onChange(verdi, feltState.id),
                value: feltState.verdi,
            };
        },
        [validerOgSettFelt, settFelterState],
    );

    const hentNavBaseSkjemaProps = useCallback(
        (visFeilmelding: boolean, id: string): NavBaseSkjemaProps<Verdi> => {
            const felt: FeltState<Verdi> | undefined = felterState.find(felt => felt.id === id);
            if (!felt) throw Error(`Fant ikke felt med id ${id} i listen av felter`);

            return {
                feil: visFeilmelding ? felt.feilmelding : undefined,
                id,
                value: felt.verdi,
            };
        },
        [validerOgSettFelt, settFelterState],
    );

    return useMemo(
        () =>
            felterState.map(feltState => ({
                ...feltState,
                hentNavInputProps: (visFeilmelding: boolean) =>
                    hentNavInputProps(visFeilmelding, feltState.id),
                hentNavBaseSkjemaProps: (visFeilmelding: boolean) =>
                    hentNavBaseSkjemaProps(visFeilmelding, feltState.id),
                nullstill,
                erSynlig,
                onChange: (verdi: Verdi | ChangeEvent) => onChange(verdi, feltState.id),
                validerOgSettFelt: (verdi: Verdi) => validerOgSettFelt(verdi, feltState.id),
            })),
        [felterState, hentNavInputProps, validerOgSettFelt, nullstill, onChange],
    );

    /*return useMemo(
        () => ({
            nullstill,
            leggTilFelt,
            felter: felterState.map(feltState => ({
                ...feltState,
                hentNavInputProps: (visFeilmelding: boolean) =>
                    hentNavInputProps(visFeilmelding, feltState.id),
                hentNavBaseSkjemaProps: (visFeilmelding: boolean) =>
                    hentNavBaseSkjemaProps(visFeilmelding, feltState.id),
                nullstill,
                erSynlig,
                onChange: (verdi: Verdi | ChangeEvent) => onChange(verdi, feltState.id),
                validerOgSettFelt: (verdi: Verdi) => validerOgSettFelt(verdi, feltState.id),
            })),
        }),
        [felterState, hentNavInputProps, validerOgSettFelt, nullstill, onChange],
    );*/
}
