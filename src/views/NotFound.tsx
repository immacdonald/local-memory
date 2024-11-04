import { FC } from 'react';
import { Button, Heading, Row, Section, Typography } from 'phantom-library';
import { Layout } from 'src/layouts';

const NotFound: FC = () => {
    return (
        <Layout>
            <Section variant="floating" hasBackground>
                <Heading subheading="404 Page Not Found Error" align="center">
                    Not Found
                </Heading>
                <Typography.Paragraph align="center">Unfortunately, the page you entered cannot be found.</Typography.Paragraph>
                <Row>
                    <Button type="primary" link="/">
                        Return Home
                    </Button>
                </Row>
            </Section>
        </Layout>
    );
};

export { NotFound };
