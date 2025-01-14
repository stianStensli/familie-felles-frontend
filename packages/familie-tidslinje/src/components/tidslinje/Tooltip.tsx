import React, { ReactNode } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

const TooltipContainer = styled.div`
    position: absolute;
    padding: 0.5rem 1rem;
    background: #ffffff;
    border-radius: 4px;
    border: 1px solid #78706a;
    color: #3e3832;
    top: 0;
    left: 50%;
    transform: translateX(-50%) translateY(calc(-100% - 10px));
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.25);
    animation-timing-function: ease-out;
    animation-duration: 0.05s;
    animation-name: fadeIn;
    cursor: default;
    z-index: 1000;

    &:before {
        content: '';
        position: absolute;
        width: 10px;
        height: 10px;
        background: #ffffff;
        left: 50%;
        bottom: -1px;
        border-bottom: 1px solid #78706a;
        border-right: 1px solid #78706a;
        box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.25);
        transform: translateX(-50%) translateY(50%) rotate(45deg);
    }

    &:after {
        content: '';
        position: absolute;
        width: 100%;
        height: 12px;
        background: transparent;
        bottom: -12px;
        left: 0;
    }
`;

interface TooltipProps {
    children: ReactNode | ReactNode[];
    className?: string;
}

export const Tooltip = ({ children, className }: TooltipProps) => (
    <TooltipContainer className={classNames(className)}>{children}</TooltipContainer>
);
