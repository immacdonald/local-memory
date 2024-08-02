import { Heading, Page, Section, Text } from 'phantom-library';
import { FC } from 'react';

const About: FC = () => {
    return (
        <Page title="About | Local Memory Project">
            <Section variant='floating'>
                <Heading minor align="center" title="About" />
                <Text>
                    The national (non-local) news media has different priorities than the local news media. If one seeks to build a collection of stories about local events, the national news media may be insufficient, with the exception of local news which "bubbles" up to the national news media. If we rely exclusively on national media, or build collections exclusively on their reports, we could be late to the important milestones which precipitate major local events, thus, run the risk of losing important stories due to link rot and content drift. Consequently, it is important to consult local sources affected by local events.
                </Text>
            </Section>
        </Page>
    );
};

export { About };
