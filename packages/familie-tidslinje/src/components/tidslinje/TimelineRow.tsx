import React from 'react';
import styled from 'styled-components';
import classNames from 'classnames';
import { TimelinePeriod } from './TimelinePeriod';
import { PositionedPeriod } from '../types.internal';

const TimelineRowStyle = styled.div(
    (props: { kompakt?: boolean }) => `
    flex: 1;
    height: ${props.kompakt ? 1.5 : 2}rem;
    display: flex;
    align-items: center;
    position: relative;
    margin-bottom: ${props.kompakt ? 1 : 1.5}rem;
`,
);

const EmptyRowHr = styled.hr(
    (props: { kompakt: boolean }) =>
        `
    flex: 1;
    height: ${props.kompakt ? 1.5 : 2}rem;
    width: 100%;
    border: none;
    background-color: #f8f8f8;
    margin-bottom: ${props.kompakt ? 1 : 1.5}rem;

    &.aktivRad {
        background-color: #e5f3ff;
    }
    `,
);

interface EmptyTimelineRowProps {
    active?: boolean;
    kompakt?: boolean;
    className: string;
}

interface TimelineRowProps {
    periods: PositionedPeriod[];
    onSelectPeriod?: (periode: PositionedPeriod) => void;
    active?: boolean;
    kompakt?: boolean;
    className: string;
}

export const EmptyTimelineRow = ({
    active = false,
    kompakt = false,
    className,
}: EmptyTimelineRowProps) => (
    <EmptyRowHr kompakt={kompakt} className={classNames(active && 'aktivRad', className)} />
);

export const TimelineRow = ({
    periods,
    onSelectPeriod,
    active = false,
    kompakt = false,
    className,
}: TimelineRowProps) => (
    <TimelineRowStyle
        kompakt={kompakt}
        className={classNames('tidslinjerad', active && 'aktivRad', className)}
    >
        {periods.map(period => (
            <TimelinePeriod
                key={period.id}
                period={period}
                onSelectPeriod={onSelectPeriod}
                active={period.active}
                kompakt={kompakt}
            />
        ))}
    </TimelineRowStyle>
);
