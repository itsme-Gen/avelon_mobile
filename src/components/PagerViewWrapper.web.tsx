import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, type ViewStyle } from 'react-native';

export type PagerViewOnPageSelectedEvent = {
    nativeEvent: { position: number };
};

type Props = {
    style?: ViewStyle;
    initialPage?: number;
    onPageSelected?: (e: PagerViewOnPageSelectedEvent) => void;
    children: React.ReactNode;
};

export const PagerView = forwardRef<{ setPage: (index: number) => void }, Props>(
    ({ style, initialPage = 0, onPageSelected, children }, ref) => {
        const [page, setPageState] = useState(initialPage);
        const pages = React.Children.toArray(children);

        useImperativeHandle(ref, () => ({
            setPage: (index: number) => {
                setPageState(index);
                onPageSelected?.({ nativeEvent: { position: index } });
            },
        }));

        return (
            <View style={style}>
                {pages[page]}
            </View>
        );
    }
);
