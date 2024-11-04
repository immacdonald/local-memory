import { FC } from 'react';
import { designTokens, Heading, Section, StyledLink, Typography } from 'phantom-library';
import { Layout } from 'src/layouts';
import styles from './Views.module.scss';

const About: FC = () => {
    return (
        <Layout title="About | Local Memory Project">
            <Section className={styles.background}>
                <div style={{ border: designTokens.border.light, padding: designTokens.space.lg, borderRadius: designTokens.borderRadius, backgroundColor: 'var(--color-background-foreground)' }}>
                    <Heading align="center">About</Heading>
                    <Typography.Paragraph>
                        Local media is vital for a healthy democracy, but sadly in{' '}
                        <StyledLink to="https://localnewsinitiative.northwestern.edu/projects/state-of-local-news/" external>
                            decline
                        </StyledLink>
                        . The Local Memory Project (LMP) is a service designed to help users discover local media in various US communities.
                    </Typography.Paragraph>
                    <Typography.Paragraph>
                        Our US local news media dataset currently has about{' '}
                        <StyledLink to="https://github.com/wm-newslab/3DLNews" external>
                            14,086 local media sources
                        </StyledLink>
                        :
                        <ul>
                            <li>9,441 Newspapers</li>
                            <li>2,449 Radio</li>
                            <li>886 TV</li>
                            <li>1,310 Broadcast (TV or Radio)</li>
                        </ul>
                    </Typography.Paragraph>
                    <Typography.Paragraph>
                        The original idea of LMP was conceived by Adam Ziegler and Anastasia Aizman at the{' '}
                        <StyledLink to="https://lil.law.harvard.edu" external>
                            Harvard Library Innovation Lab
                        </StyledLink>{' '}
                        in{' '}
                        <StyledLink to="https://web.archive.org/web/20160811070543/http://lil.law.harvard.edu:80/about" external>
                            2016
                        </StyledLink>
                        , and was first{' '}
                        <StyledLink to="https://web.archive.org/web/20181118093140/http://localmemory.org/" external>
                            implemented
                        </StyledLink>{' '}
                        by{' '}
                        <StyledLink to="https://ws-dl.blogspot.com/2016/11/2016-11-16-introducing-local-memory.html" external>
                            Alexander C. Nwala
                        </StyledLink>
                        .
                    </Typography.Paragraph>

                    <Heading minor>Publications</Heading>
                    <Typography.Text>3DLNews: A Three-decade Dataset of US Local News Articles</Typography.Text>
                    <Typography.Text newline>Gangani Ariyarathne and Alexander C. Nwala</Typography.Text>
                    <Typography.Text newline>
                        <StyledLink to="https://arxiv.org/abs/2408.04716" external>
                            CIKM
                        </StyledLink>
                    </Typography.Text>
                    <br />

                    <Heading minor>About Us</Heading>
                    <Typography.Paragraph>
                        Local Memory Project is a project of the News Web and Social Media (NEWS) research lab at{' '}
                        <StyledLink to="https://www.wm.edu/" external>
                            William & Mary
                        </StyledLink>
                        . NEWS Lab studies the web as an entity with a focus on (local) news and vectors of disinformation on social media. This service was developed by{' '}
                        <StyledLink to="https://ian-macdonald.com" external>
                            Ian MacDonald
                        </StyledLink>{' '}
                        and{' '}
                        <StyledLink to="https://alexandernwala.com/" external>
                            Alexander C. Nwala
                        </StyledLink>{' '}
                        (acnwala [at] wm.edu).
                    </Typography.Paragraph>
                </div>
            </Section>
        </Layout>
    );
};

export { About };
