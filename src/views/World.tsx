import { FC } from 'react';
import { Heading, Page, Row, Section, Typography } from 'phantom-library';
import { LocalMemoryFullIcon } from '@icons';
import { Header } from '@components/page';
import { WorldMap } from '@components/WorldMap';
import worldMediaData from '@data/world_media.json';
import style from './Views.module.scss';

const World: FC = () => {
    return (
        <Page
            title="Local Memory Project"
            header={<Header hasBackground inline dynamicSettings={{ enabled: true, scrollDistance: 1000, inline: false, hasBackground: true, pageSpace: 'pad' }} />}
            className={style.page}
        >
            <Section>
                <Heading align="center" subtitle="Local Media Across the World">
                    <LocalMemoryFullIcon size="full" />
                </Heading>
                <Row>
                    <WorldMap mediaData={worldMediaData as any} />
                </Row>
                <Typography.Paragraph>
                    Local Memory provides data about the geographic distribution of local news organizations across the globe. This website displays an interactive map showing a collection of{' '}
                    <i>newspapers</i>, <i>TV broadcasts</i>, and <i>radio stations</i> on a per-county level. This data is also sorted by proximity to your location (or any zip code).
                </Typography.Paragraph>
            </Section>
        </Page>
    );
};

export { World };
