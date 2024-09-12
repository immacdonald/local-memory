import { Button, Heading, Page, Row, Section, Typography } from 'phantom-library';
import { FC } from 'react';

const NotFound: FC = () => {
    return (
        <Page title="Local Memory Project">
            <Section variant="floating" hasBackground>
                <Heading align="center" />
                <Typography.Paragraph align="center">
                    Unfortunately, the page you entered cannot be found.
                </Typography.Paragraph>
                <Row>
                    <Button context="primary" link="/" visual="filled">Return Home</Button>
                </Row>
            </Section>
        </Page>
    );
};

export { NotFound };
