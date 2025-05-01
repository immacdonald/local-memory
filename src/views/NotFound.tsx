import type { FC } from 'react';
import { Box, Button, CircleFilledIcon, Heading, Row, Section, tokens, Typography } from 'phantom-library';
import { Layout } from 'src/layouts';

const NotFound: FC = () => {
    return (
        <Layout>
            <Section background="content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box style={{ marginTop: `calc(${tokens.space.layout.lg} * -1)`, width: 'min(75%, 600px)' }}>
                    <Heading size="major" align="center">
                        404 <CircleFilledIcon inline color={tokens.color.primary} /> Page Not Found
                    </Heading>
                    <Typography.Paragraph align="center" size="lg">
                        The page you are looking for cannot be found or no longer exists.
                    </Typography.Paragraph>
                    <Row>
                        <Button variant="outline">Back to Home</Button>
                    </Row>
                </Box>
            </Section>
        </Layout>
    );
};

export { NotFound };
